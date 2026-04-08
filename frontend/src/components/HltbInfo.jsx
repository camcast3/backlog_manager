/* HLTB (How Long to Beat) info display */
export default function HltbInfo({ mainStory, mainPlusExtras, completionist }) {
  const hasAny = mainStory || mainPlusExtras || completionist;
  if (!hasAny) return <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>HLTB data unknown</span>;

  return (
    <div className="hltb-row">
      {mainStory && (
        <div className="hltb-item">
          <div className="hltb-val">{mainStory}h</div>
          <div className="hltb-lbl">Main Story</div>
        </div>
      )}
      {mainPlusExtras && (
        <div className="hltb-item">
          <div className="hltb-val">{mainPlusExtras}h</div>
          <div className="hltb-lbl">Main + Extras</div>
        </div>
      )}
      {completionist && (
        <div className="hltb-item">
          <div className="hltb-val">{completionist}h</div>
          <div className="hltb-lbl">Completionist</div>
        </div>
      )}
    </div>
  );
}
