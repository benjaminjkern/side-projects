package coolcolors;

import java.io.IOException;

import kern.Animator;

public class CoolColors extends Animator {

    public static void main(String[] args) throws InterruptedException, IOException {
        CoolColors d = new CoolColors(640, 640, 1);
        d.go();
    }

    public CoolColors(int width, int height, int frames) {
        super(width, height, 1, "Cool Colors", frames);

        keyframes[currentFrame] = new CoolFrame(width, height, null, 1000, 10);
    }
}
