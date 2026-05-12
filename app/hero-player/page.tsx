/**
 * Minimal video player page used as the Twitter/iMessage `twitter:player` embed URL.
 * Renders the bundled hero MP4 full-bleed in a bare <video> element so messaging
 * apps that follow the player URL see a playable clip rather than a blank page.
 */
export default function HeroPlayerPage() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          *{margin:0;padding:0;box-sizing:border-box}
          html,body{width:100%;height:100%;background:#000;overflow:hidden}
          video{width:100%;height:100%;object-fit:cover;display:block}
        `}</style>
      </head>
      <body>
        <video
          src="/hero.mp4"
          autoPlay
          muted
          loop
          playsInline
          controls={false}
        />
      </body>
    </html>
  );
}
