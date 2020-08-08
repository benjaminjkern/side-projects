# Ray tracer for Hyper-Conic sections

This is a ray tracer for hyper-conic sections.

Don't know what that is? Here are some wikipedia pages that might help explain.

Hypercones:
https://en.wikipedia.org/wiki/Hypercone

Conic Sections (2 dimensional):
https://en.wikipedia.org/wiki/Conic_section

Ray tracing:
https://en.wikipedia.org/wiki/Ray_tracing_(graphics)

You can make 2 dimensional conic sections of a 3D cone, and you can make 3 dimensional conic sections of a 4D cone. That's what this does, and it uses ray tracing to render it. It is pretty stinking slow right now because I haven't gone through and made it work in parallel yet.

This project utilizes a custom tensor library, implemented in the `/kern` directory of this repo. I needed to do this because tensorflow and pytorch don't allow specific indicing of tensors. That's actually a cool tensor library, you should check it out.
