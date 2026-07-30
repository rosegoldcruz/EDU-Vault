import Waves from "@/components/ui/Waves"

export function IronVaultBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-ink"
    >
      <div className="absolute inset-0 opacity-70">
        <Waves
          lineColor="rgba(86, 230, 40, 0.4)"
          backgroundColor="transparent"
          waveSpeedX={0.02}
          waveSpeedY={0.01}
          waveAmpX={40}
          waveAmpY={20}
          friction={0.9}
          tension={0.01}
          maxCursorMove={120}
          xGap={12}
          yGap={36}
        />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_4%,rgba(86,230,40,0.16),transparent_34%),linear-gradient(145deg,rgba(49,30,82,0.62),rgba(86,230,40,0.05)_48%,transparent_72%),linear-gradient(to_bottom,rgba(41,24,69,0.05),rgba(41,24,69,0.82))]" />
    </div>
  )
}
