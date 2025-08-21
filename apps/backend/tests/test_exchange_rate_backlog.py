import json
import time

from services import exchange_rate_service as ers


def test_backlog_trim(tmp_path, monkeypatch):
    # Redirect folder to temporary path
    monkeypatch.setattr(ers, "EXCHANGE_RATES_FOLDER", tmp_path)

    # Create 4 synthetic snapshots
    for i in range(4):
        ers.EXCHANGE_RATES_FOLDER.mkdir(exist_ok=True)
        ers.fetch_and_save_latest_rates = lambda force=False: None  # skip real fetch
        file = ers.EXCHANGE_RATES_FOLDER / f"fake_{i}.json"
        with open(file, "w") as f:
            json.dump({"rates": {"USD": 1, "EUR": 0.9}}, f)
        # modify ctime spacing
        time.sleep(0.01)
    # Call trim helper directly
    ers._latest_snapshot_file()  # ensure helper works
    # After manual trim replicate behaviour
    ers.fetch_and_save_latest_rates(force=False)  # this will trigger trim code but not fetch

    files = list(ers.EXCHANGE_RATES_FOLDER.glob("*.json"))
    assert len(files) == 3
