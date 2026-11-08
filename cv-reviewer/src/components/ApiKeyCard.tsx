"use client";

import { ArrowRight, Save } from "lucide-react";
import { useState } from "react";
import { getApiKey, setApiKey } from "@/lib/apiKey";
import { getCopy } from "@/lib/copy";
import type { Locale } from "@/lib/prompt";

/**
 * Panel BYOK di sidebar. Key disimpan di localStorage browser ini saja; tidak
 * ada server yang meneruskan request (deployment statis / GitHub Pages).
 */
export function ApiKeyCard({ lang }: { lang: Locale }) {
  const c = getCopy(lang).apiKey;
  const [savedKey, setSavedKey] = useState(getApiKey);
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState(false);

  const showInput = !savedKey || editing;

  function save() {
    setApiKey(draft);
    setSavedKey(getApiKey());
    setDraft("");
    setEditing(false);
  }

  function remove() {
    setApiKey("");
    setSavedKey("");
    setEditing(false);
  }

  return (
    <div className="quota-card api-key-card">
      <div className="quota-heading"><Save size={16} /><strong>{c.title}</strong></div>

      {showInput ? (
        <>
          <p className="api-key-help" style={{ marginTop: 10 }}>{c.desc}</p>
          <input
            type="password"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && draft.trim() && save()}
            placeholder={c.placeholder}
            aria-label={c.title}
            autoComplete="off"
            spellCheck={false}
          />
          <div className="api-key-actions">
            <button onClick={save} disabled={!draft.trim()}>{c.save}</button>
            {editing && <button className="link-button" onClick={() => { setEditing(false); setDraft(""); }}>{c.change}</button>}
          </div>
        </>
      ) : (
        <>
          <div className="quota-track" style={{ marginTop: 14 }}><span /></div>
          <div className="quota-row"><span>{c.saved}</span></div>
          <div className="api-key-actions">
            <button className="link-button" style={{ marginLeft: 0 }} onClick={() => setEditing(true)}>{c.change}</button>
            <button className="link-button" onClick={remove}>{c.remove}</button>
          </div>
        </>
      )}

      <small className="api-key-help">
        {c.help} <a href={c.link} target="_blank" rel="noreferrer">AtmoRouter Dashboard <ArrowRight size={10} style={{ verticalAlign: "middle" }} /></a>
      </small>
    </div>
  );
}
