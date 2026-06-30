import type { MenuSectionRow, SiteSettingsRow } from "@/types/menu";
import { getSectionHeadingField } from "@/lib/menu-sections";

type Props = {
  section: MenuSectionRow;
  settings: SiteSettingsRow;
  /** Extra fallback for tag line (e.g. seasonal uses seasonal_tagline). */
  tagFallback?: string;
  children?: React.ReactNode;
};

export function SectionHead({ section, settings, tagFallback = "", children }: Props) {
  const the = getSectionHeadingField(section, settings, "the");
  const line1 = getSectionHeadingField(section, settings, "big_line1");
  const line2 = getSectionHeadingField(section, settings, "big_line2");
  const tag = getSectionHeadingField(section, settings, "tag", tagFallback);

  return (
    <div className="sec-head">
      {the ? <span className="sec-the">{the}</span> : null}
      <div className="sec-big">
        {line1}
        {line2 ? (
          <>
            <br />
            {line2}
          </>
        ) : null}
      </div>
      {tag ? <div className="sec-tag">✦ &nbsp; {tag}</div> : null}
      {children}
    </div>
  );
}
