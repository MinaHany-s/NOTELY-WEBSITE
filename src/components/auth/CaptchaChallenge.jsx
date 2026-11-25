import { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { fetchCaptcha } from "../../api/auth.api.js";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function CaptchaChallenge({ value, onChange, refreshKey }) {
  const { t } = useLanguage();
  const [svg, setSvg] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const lastRefreshKey = useRef();

  const loadCaptcha = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    setSvg("");
    onChange("");

    try {
      const response = await fetchCaptcha();
      if (typeof response !== "string" || !response.includes("<svg")) {
        throw new Error("The CAPTCHA response did not contain an SVG image.");
      }
      setSvg(response);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [onChange]);

  useEffect(() => {
    if (lastRefreshKey.current === refreshKey) return;
    lastRefreshKey.current = refreshKey;
    void loadCaptcha();
  }, [loadCaptcha, refreshKey]);

  return (
    <div className="captcha-widget">
      <div className="captcha-display">
        {svg ? (
          <img
            className="captcha-image"
            src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`}
            alt={t("CAPTCHA verification image")}
          />
        ) : (
          <span className="captcha-placeholder" aria-live="polite">
            {loadError
              ? t("Unable to load the CAPTCHA. Please try again.")
              : t("Loading CAPTCHA...")}
          </span>
        )}
        <button
          type="button"
          className="captcha-refresh"
          onClick={() => void loadCaptcha()}
          disabled={loading}
          aria-label={t("Refresh CAPTCHA")}
          title={t("Refresh CAPTCHA")}
        >
          <RefreshCw size={17} aria-hidden="true" />
          <span>{t("Refresh")}</span>
        </button>
      </div>
      <label className="field-label captcha-entry">
        {t("Enter the CAPTCHA")}
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck="false"
          maxLength={10}
          dir="ltr"
          aria-label={t("Enter the CAPTCHA")}
        />
      </label>
    </div>
  );
}
