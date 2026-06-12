Feedback group: `Toast`, `EmptyState`, `Skeleton`.

```jsx
<Toast type="achievement" title="Tokyo — Senso-ji unlocked!" onClose={fn} />
<Toast type="social" title="Alex beat you today." message="Rematch tomorrow." />
<EmptyState icon="nemesis" title="No nemesis yet" body="Join a group to get matched." action={<Button>Find a group</Button>} />
<Skeleton preset="leaderboard" rows={4} />
<Skeleton preset="landmark" />
<Skeleton preset="bingo" />
```

`Toast` is the slim top bar (achievement=gold, social=blue, alert=red). `EmptyState` is the encouraging icon+headline+CTA block. `Skeleton` has presets matching each loading surface.
