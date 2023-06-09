


# Complex numbers are implemented by default

x = 1 + i
y = -4i # - (4 * i)


print 

# i by itself will default to the imaginary i if all else fails but it is recommended to use 1i

print x ^ 2 # 2i

print |x| ^ 2 # 2, this is done fast-like

print |x| # 1.4142135623730951

print ~x # 1 - i

print x * ~x # 2

# This is just a funny result of this
print ~1 # 1

print ~i == -i


print (real(x) + imag(x))

print real x + imag x # This is ambiguous and will throw a warning

print (real x) + imag x # this shouldn't be ambiguous