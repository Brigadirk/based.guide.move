import json
from pathlib import Path

from modules.story_generator import make_story

ROOT = Path(__file__).resolve().parent.parent


def load_sample():
    return json.loads((ROOT / "tax_migration_profile_test.json").read_text())


def test_story_contains_all_sections():
    profile = load_sample()
    story = make_story(profile)
    for header in [
        "Personal Information:",
        "Residency Plans:",
        "Education:",
        "Finance:",
        "Social Security & Pensions:",
        "Future Financial Plans:",
        "Tax Deductions & Credits:",
        "Additional Information:",
    ]:
        assert header in story 