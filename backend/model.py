def calculate_caffeine(hours_passed, original_amount):
    return original_amount * (0.5 ** (hours_passed / 5))

# cups is list of tuples (time_ingested, amount)
# time is hour of bedtime, e.g.: 22
def total_caffeine(cups, bedtime):
    total = 0
    for (time_ingested, amount) in cups:
        total += calculate_caffeine(bedtime - time_ingested, amount)
        print(total)

    return total <= 60

# print(total_caffeine([(8, 180), (11, 180)], 24))
