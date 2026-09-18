import type { Tier } from "@/api/loyalty";
import type { LoyaltyAccount } from "@/types";

function firstName(email: string | undefined): string | null {
  if (!email) return null;
  const raw = email.split("@")[0].replace(/[._-]+/g, " ").trim();
  return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : null;
}

/** Editorial hero: eyebrow, serif balance, tier line, benefits line. No cards. */
export default function LoyaltyHero({
  account,
  tier,
  email,
}: {
  account: LoyaltyAccount;
  tier: Tier | undefined;
  email: string | undefined;
}) {
  const name = firstName(email);
  return (
    <div>
      <p className="font-accent text-xs font-bold uppercase tracking-[0.2em] text-primary">Glow Points</p>
      <h1 className="mt-2 font-display text-[34px] font-medium tracking-tight text-ink md:text-[40px]">
        {name ? `${name}'s glow` : "Your glow"}
      </h1>
      <p className="mt-1 text-[15px] text-ink/60">A little more back with every visit.</p>

      <p className="mt-8 font-display text-[64px] font-medium leading-none tracking-tight text-ink md:text-[76px]">
        {account.pointsBalance.toLocaleString("en-IN")}
      </p>
      <p className="mt-1 font-accent text-sm font-semibold uppercase tracking-[0.14em] text-ink/55">
        Glow Points
      </p>

      <p className="mt-4 text-[16px] text-ink/75">
        <b className="font-display text-lg font-medium text-primary">{account.tier} member</b>
        {tier && tier.benefits.length > 0 && (
          <span className="text-ink/60"> · {tier.benefits.slice(0, 2).join(" · ")}</span>
        )}
      </p>
    </div>
  );
}
