"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Textarea } from "@/components/ui/textarea";
import { characterCount, MAX_MESSAGE_LENGTH, mergePosts, messageError, type Post } from "@/lib/posts";
import { createWallClient } from "@/lib/supabase";
import { PHOTO_BUCKET, PHOTO_TYPES, photoError } from "@/lib/photos";

export function Wall() {
  const [client] = useState(createWallClient);
  const [posts, setPosts] = useState<Post[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(Boolean(client));
  const [saving, setSaving] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [feedError, setFeedError] = useState("");
  const [shareError, setShareError] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [connection, setConnection] = useState("Connecting");
  const [sharedId, setSharedId] = useState("");
  const [photo, setPhoto] = useState<{ file: File; preview: string } | null>(null);
  const [photoReady, setPhotoReady] = useState(false);
  const [photoProblem, setPhotoProblem] = useState("");
  const uploadedPhoto = useRef<{ file: File; path: string } | null>(null);
  const pageSize = useRef(50);
  const latestRequest = useRef(0);
  const mounted = useRef(false);
  const submitting = useRef(false);
  const input = useRef<HTMLTextAreaElement>(null);
  const length = characterCount(body);
  const validation = messageError(body);

  useEffect(() => () => {
    if (photo) URL.revokeObjectURL(photo.preview);
  }, [photo]);

  function removePhoto() {
    setPhoto(null);
    setPhotoReady(false);
    setPhotoProblem("");
    uploadedPhoto.current = null;
  }

  function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    const problem = photoError(file);
    setPhotoProblem(problem ?? "");
    if (problem) return;
    setPhotoReady(false);
    uploadedPhoto.current = null;
    setPhoto({ file, preview: URL.createObjectURL(file) });
    setShareError("");
    setAnnouncement("");
  }

  const loadPosts = useCallback(async () => {
    if (!client) return;
    const request = ++latestRequest.current;
    const size = pageSize.current;
    setLoading(true);
    setFeedError("");
    try {
      const { data, error } = await client.from("posts").select("id, author_name, body, created_at, image_path")
        .order("created_at", { ascending: false }).order("id", { ascending: false }).limit(size + 1);
      if (error) throw error;
      if (!mounted.current || request !== latestRequest.current) return;
      // Merge so an INSERT received during the fetch cannot disappear.
      setPosts(current => mergePosts(current, data.slice(0, size)));
      setHasMore(data.length > size);
    } catch {
      if (mounted.current && request === latestRequest.current) {
        setFeedError("We couldn't load the wall. Check your connection and try again.");
      }
    } finally {
      if (mounted.current && request === latestRequest.current) setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    mounted.current = true;
    if (!client) return () => { mounted.current = false; };
    void loadPosts();
    const channel = client.channel("wall-posts")
      .on<Post>("postgres_changes", { event: "INSERT", schema: "public", table: "posts" }, event => {
        if (mounted.current) setPosts(current => mergePosts(current, [event.new]));
      })
      .subscribe(status => {
        if (!mounted.current) return;
        if (status === "SUBSCRIBED") {
          setConnection("Live updates on");
          // Also catch messages missed while connecting or reconnecting.
          void loadPosts();
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          setConnection("Live updates paused");
        }
      });
    return () => {
      mounted.current = false;
      ++latestRequest.current;
      void client.removeChannel(channel);
    };
  }, [client, loadPosts]);

  async function share(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!client || validation || (photo && !photoReady) || submitting.current) return;
    submitting.current = true;
    setSaving(true);
    setShareError("");
    setAnnouncement("");
    try {
      let imagePath: string | null = null;
      if (photo) {
        if (uploadedPhoto.current?.file !== photo.file) {
          const path = `${crypto.randomUUID()}.${PHOTO_TYPES.get(photo.file.type)}`;
          const { error } = await client.storage.from(PHOTO_BUCKET).upload(path, photo.file, {
            contentType: photo.file.type, upsert: false,
          });
          if (error) throw error;
          uploadedPhoto.current = { file: photo.file, path };
        }
        // Reuse the upload if saving the post fails; keep the draft for retry.
        imagePath = uploadedPhoto.current.path;
      }
      // shortcut: abandoned uploads need admin cleanup; add scheduled cleanup if storage grows.
      const { data, error } = await client.from("posts").insert({ body: body.trim(), image_path: imagePath })
        .select("id, author_name, body, created_at, image_path").single();
      if (error) throw error;
      if (!mounted.current) return;
      setPosts(current => mergePosts(current, [data]));
      setSharedId(data.id);
      setBody("");
      removePhoto();
      setAnnouncement("Your message is on the wall.");
      input.current?.focus();
    } catch {
      if (mounted.current) setShareError("Your message wasn't shared. Your draft is still here — please try again.");
    } finally {
      submitting.current = false;
      if (mounted.current) setSaving(false);
    }
  }

  return (
    <>
      <a className="skip-link" href="#wall">Skip to the wall</a>
      <header className="masthead">
        <div className="masthead-inner">
          <a className="wordmark" href="/" aria-label="My Wall home">my wall<span aria-hidden="true">.</span></a>
          <p>A little more connected.</p>
        </div>
      </header>

      <main className="page-frame" id="wall">
        <aside className="profile" aria-label="About this wall">
          <div className="profile-picture" aria-hidden="true">mw<span>.</span></div>
          <div className="profile-copy">
            <h2>My Wall</h2>
            <p>A place for your thoughts<br className="desktop-break" /> and everyone else's.</p>
          </div>
          <a className="wall-link" href="#messages" aria-current="page">The Wall</a>
          <div className="about-wall">
            <h3>About this wall</h3>
            <p>Remember when sharing was simple? A thought, a hello, a little update.</p>
            <p>Leave something here. Make someone's day.</p>
          </div>
        </aside>

        <div className="wall-main">
          <div className="wall-title">
            <div><h1>The Wall</h1><p>Good to see you here.</p></div>
            <span className={`connection ${connection === "Live updates on" && client ? "is-live" : ""}`} role="status">
              <span className="status-dot" aria-hidden="true" />{client ? connection : "Offline"}
            </span>
          </div>

          <section className="composer" aria-labelledby="composer-label">
            <div className="composer-tab">Write something</div>
            <form onSubmit={share}>
              <label id="composer-label" htmlFor="message">What's on your mind?</label>
              <Textarea id="message" ref={input} value={body} placeholder="A thought, a hello, a little update…"
                onChange={event => { setBody(event.target.value); setShareError(""); setAnnouncement(""); }}
                disabled={saving || !client} aria-invalid={length > MAX_MESSAGE_LENGTH}
                aria-describedby="character-count posting-note" />
              <div className="photo-upload">
                <label htmlFor="photo">Add a photo <span>(optional)</span></label>
                <input id="photo" type="file" accept="image/jpeg,image/png,image/webp"
                  onChange={choosePhoto} disabled={saving || !client} aria-describedby="photo-help"
                  aria-invalid={Boolean(photoProblem)} />
                <p id="photo-help">One JPG, PNG, or WebP photo, up to 5 MB. Add a message above to share it.</p>
              </div>
              {photo ? <div className="photo-preview">
                <img key={photo.preview} src={photo.preview} alt="Selected photo preview"
                  onLoad={() => setPhotoReady(true)} onError={() => {
                    removePhoto();
                    setPhotoProblem("This photo couldn't be opened. Please choose another.");
                  }} />
                <div><span>{photo.file.name}</span><button type="button" className="text-button" onClick={removePhoto} disabled={saving}>Remove photo</button></div>
              </div> : null}
              {photoProblem ? <p className="error-message" role="alert">{photoProblem}</p> : null}
              <div className="composer-actions">
                <span className="posting-as">Posting as <strong>Wall Visitor</strong></span>
                <div className="share-controls">
                  <span id="character-count" className={`character-count ${length > MAX_MESSAGE_LENGTH ? "over-limit" : ""}`}>
                    <span className="sr-only">Characters: </span>{length} / {MAX_MESSAGE_LENGTH}
                  </span>
                  <button className="share-button" type="submit" disabled={!client || saving || Boolean(validation) || Boolean(photo && !photoReady)}>
                    {saving ? "Sharing…" : "Share"}
                  </button>
                </div>
              </div>
              <p id="posting-note" className="posting-note">Everyone can see your message and photo. No account needed.</p>
              {length > MAX_MESSAGE_LENGTH ? <p className="error-message">{validation}</p> : null}
              {shareError ? <p className="error-message" role="alert">{shareError}</p> : null}
              <p className="share-announcement" role="status">{announcement}</p>
            </form>
          </section>

          <section className="messages" aria-labelledby="messages-heading" id="messages" aria-busy={loading}>
            <div className="feed-heading"><h2 id="messages-heading">Wall posts</h2><span>Newest first</span></div>
            {!client ? <p className="empty-message">The wall is taking a short break. Please check back soon.</p> : null}
            {feedError ? <div className="feed-error" role="alert"><p>{feedError}</p><button className="text-button" onClick={() => void loadPosts()}>Try again</button></div> : null}
            {client && !loading && !feedError && posts.length === 0 ? (
              <div className="empty-message"><h3>Every wall starts with a hello.</h3><p>Be the first to leave a message.</p></div>
            ) : null}
            <ol className="post-list">
              {posts.map(post => (
                <li key={post.id} className={`post ${post.id === sharedId ? "just-shared" : ""}`}>
                  <div className="post-avatar" aria-hidden="true">WV</div>
                  <article>
                    <h3>{post.author_name}</h3>
                    <p className="post-body">{post.body}</p>
                    {post.image_path && client ? <img className="post-photo"
                      src={client.storage.from(PHOTO_BUCKET).getPublicUrl(post.image_path).data.publicUrl}
                      alt="Photo attached to this post" loading="lazy" decoding="async" /> : null}
                    <time dateTime={post.created_at}>{new Date(post.created_at).toLocaleString(undefined, {
                      month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
                    })}</time>
                  </article>
                </li>
              ))}
            </ol>
            {loading ? <p className="loading-message" role="status">Loading messages…</p> : null}
            {hasMore ? <button className="older-button" disabled={loading} onClick={() => { pageSize.current += 50; void loadPosts(); }}>Load older messages</button> : null}
            {client && connection === "Live updates paused" ? <p className="live-paused">New messages may be delayed. <button className="text-button" disabled={loading} onClick={() => void loadPosts()}>Refresh the wall</button></p> : null}
          </section>
          <footer className="wall-footer"><span>My Wall</span><p>A small corner of the internet, shared.</p></footer>
        </div>
      </main>
    </>
  );
}
