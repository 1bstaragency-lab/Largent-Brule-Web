// /admin/homepage — manage the carousel video that renders on the VIP
// gate (between the logo and the countdown). Joseph uploads a video file
// (or pastes a URL); the homepage reads it from app_settings.
import { HomepagePanel } from './panel';

export const dynamic = 'force-dynamic';

export default function HomepageAdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[9px] text-neutral-400 uppercase tracking-[0.6em] mb-2">
          Homepage
        </p>
        <h1 className="text-3xl font-light">Carousel video</h1>
        <p className="text-[11px] text-neutral-500 mt-2 tracking-wide">
          Renders on the VIP gate between the L&apos;B logo and the countdown.
          Auto-plays muted on loop.
        </p>
      </div>
      <HomepagePanel />
    </div>
  );
}
