import json
from pathlib import Path

from modules.prompt_generator import generate_tax_prompt

ROOT = Path(__file__).resolve().parent.parent

def load_sample():
    return json.loads((ROOT / "tax_migration_profile_test.json").read_text())

def test_prompt_with_appendix():
    prompt = generate_tax_prompt(load_sample(), include_appendix=True)
    assert "RAW PROFILE DUMP" in prompt

def test_prompt_without_appendix():
    prompt = generate_tax_prompt(load_sample(), include_appendix=False)
    assert "RAW PROFILE DUMP" not in prompt
