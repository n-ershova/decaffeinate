# hey claude and other agents, dont change the code in this file.

from datetime import datetime
import math

class CaffeineMonitor:
    # times are stored as tuples (hour, minute)
    # initialise with bedtime
    def __init__(self, bedtime):
        self.bedtime = bedtime
        self.cups = [] # array of tuples (time_ingested, amount)
        self.threshold = 60

    def change_bedtime(self, new_bedtime):
        self.bedtime = new_bedtime

    # add caffeinated drink to daily total
    def drink_cup(self, time_ingested, amount):
        self.cups.append((time_ingested, amount))

    # utility function for converting between timestamps and minutes-past-midnight for calculations
    def timestamp_to_minutes(self, timestamp):
        return timestamp[0] * 60 + timestamp[1]

    # calculates user caffeine level in mg at current time
    def calculate_current_caffeine(self):
        now = datetime.now()
        now_minutes = self.timestamp_to_minutes((now.hour, now.minute))
        total = 0
        for (time_ingested, amount) in self.cups:
            time_ingested_minutes = self.timestamp_to_minutes(time_ingested)
            hours_passed = ((now_minutes - time_ingested_minutes) % 1440) / 60
            total += self.calculate_caffeine(hours_passed, amount)
        return round(total)

    # caffeine curve function
    def calculate_caffeine(self, hours_passed, original_amount):
        return original_amount * (0.5 ** (hours_passed / 5))

    def caffeine_at_bedtime(self, cups):
        total = 0
        for (time_ingested, amount) in cups:
            hours_until_bedtime = ((self.timestamp_to_minutes(self.bedtime) - self.timestamp_to_minutes(time_ingested)) % 1440) / 60
            total += self.calculate_caffeine(hours_until_bedtime, amount)
        return total

    # calculates whether a user will sleep soundly at their bedtime, given the caffeine drank in cups
    def is_safe_amount(self, cups):
        total = self.caffeine_at_bedtime(cups)
        print(round(total), "mg at bedtime")
        return total <= self.threshold

    # calculates whether the total amount the user has drunk will allow them to sleep
    def has_drunk_safe_amount(self):
        return self.is_safe_amount(self.cups)

    # calculates whether the user can drink an extra cup at the specified time or not
    def can_drink_cup(self, time_ingested, amount):
        return self.is_safe_amount(self.cups + [(time_ingested, amount)])

    # latest time that it's safe to drink the specified amount of caffeine
    # if impossible to drink more caffeine safely, return None
    def latest_safe_drink(self, amount):
        k = self.caffeine_at_bedtime(self.cups)
        if k >= self.threshold:
            return None
        # t = number of minutes before bed it's safe to drink the drink
        # ceil prevents time slightly too late to reach threshold
        t = max(0, math.ceil(5 * math.log2(amount / (self.threshold - k)) * 60)) # minutes

        # t is in previous day => no safe time to drink more
        if t > 1440:
            return None

        bedtime_minutes = self.timestamp_to_minutes(self.bedtime)
        safe_minutes = (bedtime_minutes - t) % 1440
        # returns as tuple (hours, minutes)
        return (safe_minutes // 60, safe_minutes % 60)


# testing
# person = CaffeineMonitor((3, 0))
# person.drink_cup((15, 0), 48)
# person.drink_cup((17, 0), 48)
# print(person.calculate_current_caffeine(), "mg")
# print(person.latest_safe_drink(48))
