from matplotlib import pyplot as plt
from matplotlib import animation
import numpy as np


# First set up the figure, the axis, and the plot element we want to animate
fig = plt.figure()
ax = plt.axes(xlim=(0, 17000), ylim=(-2, 2))
scatter, = ax.plot([], [], 'o', ms=1)

# initialization function: plot the background of each frame


def init():
    scatter.set_data([], [])
    return scatter,

# animation function.  This is called sequentially


def animate(i):
    sequence = [0]

    while len(sequence) < 17000:
        l = len(sequence)
        while l > 0:
            l -= 1
            try:
                sequence.append(sequence[l]**2 - 2 + i*0.01)
            except:
                print('eh eh eh')

    scatter.set_data(range(len(sequence)), sequence)
    return scatter,


# call the animator.  blit=True means only re-draw the parts that have changed.
anim = animation.FuncAnimation(fig, animate, init_func=init,
                               frames=225, interval=20, blit=True)

# save the animation as an mp4.  This requires ffmpeg or mencoder to be
# installed.  The extra_args ensure that the x264 codec is used, so that
# the video can be embedded in html5.  You may need to adjust this for
# your system: for more information, see
# http://matplotlib.sourceforge.net/api/animation_api.html
anim.save('basic_animation.html', fps=30, extra_args=['-vcodec', 'libx264'])

plt.show()
