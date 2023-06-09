import sys


def sqrt(x, epsilon=1e-15):
    if x < 0:
        raise Exception("Cannot take the square root of a negative number!")
    a = 0
    b = sys.float_info.max

    while b - a > epsilon * a:
        c = (b + a) / 2
        csquared = c * c

        if csquared == x:
            return c
        if csquared > x:
            b = c
        else:
            a = c

    return a


print(sqrt(-10))
