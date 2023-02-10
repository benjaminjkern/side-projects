import plotly.express as px

cache = {}

def V(S, s, n):
    if s >= S: return 1
    if n <= 0 or s == 0: return 0
    key = str(s)+','+str(n)
    if key in cache.keys(): return max(cache[key])
    cache[key] = [0.6 * V(S, s + i, n - 1) + 0.4*V(S, s - i, n - 1) for i in range(s+1)]
    return max(cache[key])

V(100, 1, 10)

fig = px.line(cache['50,3'])
fig.show()
