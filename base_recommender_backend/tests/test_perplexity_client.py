from unittest.mock import patch

import requests

from api.perplexity import get_tax_advice


class MockResponse:
    def __init__(self, status_code: int, json_data=None, text=""):
        self.status_code = status_code
        self._json = json_data or {}
        self.text = text

    def json(self):
        return self._json

    def raise_for_status(self):
        if self.status_code >= 400:
            raise requests.exceptions.HTTPError(self.text)


def test_fallback_on_unknown_model():
    calls = []

    def mock_post(url, headers, json):
        # First request uses labs model and fails, second uses fallback and succeeds
        calls.append(json["model"])
        if json["model"].endswith("labs"):
            return MockResponse(400, text="Unknown model")
        return MockResponse(200, json_data={"reply": "ok"})

    with patch("api.perplexity.requests.post", side_effect=mock_post):
        result = get_tax_advice("Hello")

    # Ensure both models attempted
    assert calls[0].endswith("labs")
    assert calls[1].endswith("deep-research")
    assert result["status"] == "success" 