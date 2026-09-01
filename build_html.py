#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build lobe-pump-selector.html from template + engine.js (single source of truth for the engine)."""
import pathlib

root = pathlib.Path(__file__).parent
engine = (root / 'engine.js').read_text(encoding='utf-8')
tpl = (root / 'lobe-pump-selector.template.html').read_text(encoding='utf-8')
assert '/*__RLP_ENGINE__*/' in tpl
out = tpl.replace('/*__RLP_ENGINE__*/', engine)
(root / 'lobe-pump-selector.html').write_text(out, encoding='utf-8')
print(f"OK — lobe-pump-selector.html ({len(out):,} bytes, engine {len(engine):,} bytes)")
