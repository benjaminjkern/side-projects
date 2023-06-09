

def factmod100(x):
    a = 1
    for i in range(x):
        a = (a * (i + 1)) % 100
    return a


def pow101mod100(x):
    a = 1
    for i in range(101):
        a = (a * x) % 100
    return a


s = 0
for x in range(101):
    s = (s + factmod100(x + 1)) % 100

print(pow101mod100(s))
