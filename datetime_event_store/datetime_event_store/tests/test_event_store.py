"""
Tests unitaires pour le module DatetimeEventStore

Ce module contient des tests complets pour valider le fonctionnement
de la classe DatetimeEventStore. Les tests couvrent les fonctionnalités
de base ainsi que des cas limites et des scénarios de performance.
"""

import unittest
import datetime
from datetime_event_store import DatetimeEventStore

class TestDatetimeEventStore(unittest.TestCase):
    """
    Tests unitaires pour la classe DatetimeEventStore.
    """
    
    def setUp(self):
        """
        Préparation des tests.
        """
        self.store = DatetimeEventStore()
        
        self.dates = [
            datetime.datetime(2019, 1, 1, 12, 0),
            datetime.datetime(2019, 2, 1, 12, 0),
            datetime.datetime(2019, 3, 1, 12, 0),
            datetime.datetime(2019, 4, 1, 12, 0),
            datetime.datetime(2019, 5, 1, 12, 0),
        ]
        
        importances = ["basse", "normal", "haute", "critique", "normal"]
        
        for i, date in enumerate(self.dates):
            self.store.store_event(date, f"Test event {i}", importances[i])
    
    def test_store_and_retrieve_single_event(self):
        """
        Test du stockage et de la récupération d'un seul événement.
        """
        store = DatetimeEventStore()
        
        event_date = datetime.datetime(2020, 1, 1, 12, 0)
        event_name = "Test single event"
        event_importance = "haute"
        store.store_event(event_date, event_name, event_importance)
        
        events = list(store.get_events(
            start=datetime.datetime(2020, 1, 1),
            end=datetime.datetime(2020, 1, 2)
        ))
        
        self.assertEqual(len(events), 1)
        self.assertEqual(events[0].at, event_date)
        self.assertEqual(events[0].name, event_name)
        self.assertEqual(events[0].importance, event_importance)
    
    def test_get_events_in_range(self):
        """
        Test de la récupération d'événements dans une plage de dates.
        """
        events = list(self.store.get_events(
            start=datetime.datetime(2019, 2, 1),
            end=datetime.datetime(2019, 4, 30)
        ))
        
        self.assertEqual(len(events), 3)  
        self.assertEqual(events[0].at, self.dates[1])  
        self.assertEqual(events[1].at, self.dates[2])  
        self.assertEqual(events[2].at, self.dates[3]) 
    
    def test_get_events_empty_range(self):
        """
        Test de la récupération d'événements dans une plage vide.
        """
        events = list(self.store.get_events(
            start=datetime.datetime(2018, 1, 1),
            end=datetime.datetime(2018, 12, 31)
        ))
        
        self.assertEqual(len(events), 0)
    
    def test_events_are_sorted(self):
        """
        Test que les événements sont triés par date.
        """
        store = DatetimeEventStore()
        
        dates = [
            datetime.datetime(2020, 3, 1),
            datetime.datetime(2020, 1, 1),
            datetime.datetime(2020, 2, 1),
        ]
        
        for i, date in enumerate(dates):
            store.store_event(date, f"Unsorted event {i}", "normal")
        
        events = list(store.get_events(
            start=datetime.datetime(2020, 1, 1),
            end=datetime.datetime(2020, 12, 31)
        ))
        
        self.assertEqual(len(events), 3)
        self.assertEqual(events[0].at, dates[1])  
        self.assertEqual(events[1].at, dates[2])  
        self.assertEqual(events[2].at, dates[0])  
        
    def test_start_greater_than_end(self):
        """
        Test que la méthode fonctionne même si start > end
        """
        store = DatetimeEventStore()
        event_date = datetime.datetime(2022, 6, 15)
        store.store_event(event_date, "Test event", "normale")
        
        events = list(store.get_events(
            start=datetime.datetime(2022, 7, 1),
            end=datetime.datetime(2022, 6, 1)
        ))
        
        self.assertEqual(len(events), 1)
        self.assertEqual(events[0].at, event_date)
        self.assertEqual(events[0].name, "Test event")
        self.assertEqual(events[0].importance, "normale")
    
    def test_invalid_datetime_type(self):
        """
        Test que le store rejette les types non datetime
        """
        store = DatetimeEventStore()
        
        with self.assertRaises(TypeError):
            store.store_event("2022-01-01", "Invalid event", "normal")
            
    def test_events_with_same_timestamp(self):
        """
        Test que plusieurs événements avec le même timestamp sont correctement gérés
        """
        store = DatetimeEventStore()
        
        same_date = datetime.datetime(2022, 5, 10, 12, 0)
        
        store.store_event(same_date, "Event 1", "basse")
        store.store_event(same_date, "Event 2", "normale")
        store.store_event(same_date, "Event 3", "haute")
        
        events = list(store.get_events(
            start=datetime.datetime(2022, 5, 10),
            end=datetime.datetime(2022, 5, 11)
        ))
        
        self.assertEqual(len(events), 3)
        self.assertEqual(events[0].at, same_date)
        self.assertEqual(events[0].name, "Event 1")
        self.assertEqual(events[0].importance, "basse")
        
        self.assertEqual(events[1].at, same_date)
        self.assertEqual(events[1].name, "Event 2")
        self.assertEqual(events[1].importance, "normale")
        
        self.assertEqual(events[2].at, same_date)
        self.assertEqual(events[2].name, "Event 3")
        self.assertEqual(events[2].importance, "haute")

if __name__ == "__main__":
    unittest.main()