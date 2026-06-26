'use client';

type SkolrLoaderProps = {
  size?: 'sm' | 'md' | 'lg';
  tone?: 'light' | 'dark';
  label?: string;
  inline?: boolean;
  fullScreen?: boolean;
  center?: boolean;
  className?: string;
};

const SIZE_MAP = {
  sm: 18,
  md: 34,
  lg: 58,
} as const;

export default function SkolrLoader({
  size = 'md',
  tone = 'dark',
  label,
  inline = false,
  fullScreen = false,
  center = false,
  className = '',
}: SkolrLoaderProps) {
  const pixelSize = SIZE_MAP[size];
  const wrapperClass = [
    inline ? 'sk-loader-inline' : 'sk-loader-stack',
    center ? 'sk-loader-center' : '',
    fullScreen ? 'sk-loader-fullscreen' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={wrapperClass} data-tone={tone}>
      <span
        className="sk-loader-shell"
        style={{ width: pixelSize, height: pixelSize }}
        aria-hidden="true"
      >
        <span className="sk-loader-halo" />
        <span className="sk-loader-orbit" />
        <span className="sk-loader-core">
          <span className="sk-loader-mark" />
          <span className="sk-loader-mark" />
          <span className="sk-loader-mark" />
        </span>
      </span>
      {label ? <span className="sk-loader-label">{label}</span> : null}
    </div>
  );
}
