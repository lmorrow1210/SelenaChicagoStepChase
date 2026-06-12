The forms group: dark-fill text/numeric `Input` and a `Slider` for step targets.

```jsx
<Input label="Group name" placeholder="Lakefront Steppers" value={v} onChange={e=>setV(e.target.value)} />
<Input variant="numeric" suffix="steps" value={pred} onChange={...} />
<Slider label="Daily step target" value={8000} min={2000} max={20000} step={500} onChange={setN} />
```

All inputs use `--card` fill, `--cream` text, and a `--blue` focus ring. The numeric Input variant is the large centered monospaced field for the Prediction screen.
