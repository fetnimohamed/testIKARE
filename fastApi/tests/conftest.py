import pytest
from datetime import datetime
from unittest.mock import MagicMock, patch
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

@pytest.fixture(autouse=True)
def mock_settings():
    with patch("config.settings") as mock_settings:
        mock_settings.MONGODB_URI = "mongodb://testdb:27017/"
        mock_settings.MONGODB_DB_NAME = "test_event_store"
        mock_settings.MONGODB_COLLECTION = "test_events"
        mock_settings.API_ENV = "test"
        mock_settings.DEBUG = True
        yield mock_settings

@pytest.fixture
def mock_mongo_client():
    with patch("pymongo.MongoClient") as mock_client:
        mock_collection = MagicMock()
        
        mock_collection.find.return_value = []
        mock_collection.find_one.return_value = None
        mock_collection.insert_one.return_value = MagicMock(inserted_id="test_id")
        mock_collection.update_one.return_value = MagicMock(modified_count=1)
        mock_collection.delete_one.return_value = MagicMock(deleted_count=1)
        
        mock_db = MagicMock()
        mock_db.__getitem__.return_value = mock_collection
        
        mock_client.return_value.__getitem__.return_value = mock_db
        
        yield mock_client, mock_collection

@pytest.fixture
def test_event():
    return {
        "id": "test_id",
        "name": "Test Event",
        "importance": "normale",
        "at": datetime.now(),
        "created_at": datetime.now(),
        "updated_at": None
    }

@pytest.fixture
def test_events():
    now = datetime.now()
    return [
        {
            "id": "1",
            "name": "Test Event 1",
            "importance": "normale",
            "at": now,
            "created_at": now,
            "updated_at": None
        },
        {
            "id": "2",
            "name": "Test Event 2",
            "importance": "haute",
            "at": now,
            "created_at": now,
            "updated_at": None
        },
        {
            "id": "3",
            "name": "Test Event 3",
            "importance": "critique",
            "at": now,
            "created_at": now,
            "updated_at": None
        }
    ]