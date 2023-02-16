/***
 assignment1.cpp
 Assignment-1: Cartoonify

 Name: Kern, Ben

 Project Summary:
 I drew a cuttlefish using Chaikin's curve algorithm. I used an iterated approach, and for calculating position points I used a helper method.
 
 ***/

#ifdef __APPLE__
#include <OpenGL/gl.h>
#include <OpenGL/glu.h>
#include <GLUT/glut.h>
#else
#include <GL/gl.h>
#include <GL/glu.h>
#include <GL/glut.h>
#endif

#include <vector>
#include <iostream>
using namespace std;

class Vertex
{
    GLfloat x, y;

public:
    Vertex(GLfloat, GLfloat);
    GLfloat get_y() { return y; };
    GLfloat get_x() { return x; };
};

Vertex::Vertex(GLfloat X, GLfloat Y)
{
    x = X;
    y = Y;
}

void setup()
{
    glClearColor(1.0f, 1.0f, 1.0f, 1.0f);
}

// Helping function so I didn't have to translate all of the coordinates of the original image myself

Vertex get_point(int x, int y)
{
    auto x_min = 49;
    auto y_min = 106;
    auto x_max = 849;
    auto y_max = 599;

    return Vertex(float(x - x_min) * 2 / float(x_max - x_min) - 1, (-float(y - y_min) * 2 / float(y_max - y_min) + 1) * float(y_max - y_min) / float(x_max - x_min));
}

vector<Vertex> generate_points(vector<Vertex> control_points)
{
    vector<Vertex> points;

    points.insert(points.begin(), *control_points.begin());
    for (int i = 0; i < control_points.size() - 1; i++)
    {
        Vertex p1((3 * control_points.at(i).get_x() + control_points.at(i + 1).get_x()) / 4, (3 * control_points.at(i).get_y() + control_points.at(i + 1).get_y()) / 4);
        Vertex p2((control_points.at(i).get_x() + 3 * control_points.at(i + 1).get_x()) / 4, (control_points.at(i).get_y() + 3 * control_points.at(i + 1).get_y()) / 4);
        points.push_back(p1);
        points.push_back(p2);
    }
    points.insert(points.end(), *(control_points.end() - 1));

    return points;
}

void draw_curve(vector<Vertex> control_points, int n_iter)
{
    vector<Vertex> chaikin = control_points;

    for (int n = 0; n < n_iter; n++)
    {
        chaikin = generate_points(chaikin);
    }

    glBegin(GL_LINES);

    for (int i = 0; i < chaikin.size() - 1; i++)
    {
        glVertex2f(chaikin.at(i).get_x(), chaikin.at(i).get_y());
        glVertex2f(chaikin.at(i + 1).get_x(), chaikin.at(i + 1).get_y());
    }
    glEnd();
}

void display()
{
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    // Set our color to black (R, G, B)
    glColor3f(0.0f, 0.0f, 0.0f);

    //HEAD

    vector<Vertex> start;
    start.push_back(get_point(492, 230));
    start.push_back(get_point(547, 162));
    start.push_back(get_point(606, 209));
    draw_curve(start, 5);

    start.clear();
    start.push_back(get_point(594, 200));
    start.push_back(get_point(618, 190));
    start.push_back(get_point(668, 164));
    start.push_back(get_point(712, 199));
    start.push_back(get_point(717, 249));
    start.push_back(get_point(829, 485));
    start.push_back(get_point(847, 525));
    start.push_back(get_point(833, 557));
    draw_curve(start, 5);

    start.clear();
    start.push_back(get_point(833, 557));
    start.push_back(get_point(827, 549));
    draw_curve(start, 0);

    start.clear();
    start.push_back(get_point(827, 549));
    start.push_back(get_point(797, 578));
    start.push_back(get_point(794, 577));
    draw_curve(start, 5);

    start.clear();
    start.push_back(get_point(794, 577));
    start.push_back(get_point(780, 579));
    start.push_back(get_point(783, 571));
    start.push_back(get_point(792, 563));
    start.push_back(get_point(779, 562));
    start.push_back(get_point(766, 563));
    start.push_back(get_point(772, 554));
    start.push_back(get_point(782, 547));
    start.push_back(get_point(772, 538));
    draw_curve(start, 5);

    start.clear();
    start.push_back(get_point(772, 538));
    start.push_back(get_point(721, 531));
    start.push_back(get_point(681, 507));
    start.push_back(get_point(544, 442));
    start.push_back(get_point(492, 415));
    start.push_back(get_point(491, 351));
    start.push_back(get_point(492, 230));
    draw_curve(start, 5);

    // TENTACLES

    start.clear();
    start.push_back(get_point(674, 232));
    start.push_back(get_point(805, 487));
    start.push_back(get_point(813, 530));
    start.push_back(get_point(784, 552));
    draw_curve(start, 5);

    start.clear();
    start.push_back(get_point(805, 487));
    start.push_back(get_point(822, 498));
    start.push_back(get_point(828, 547));
    draw_curve(start, 5);

    start.clear();
    start.push_back(get_point(819, 506));
    start.push_back(get_point(814, 547));
    start.push_back(get_point(789, 563));
    draw_curve(start, 5);

    start.clear();
    start.push_back(get_point(692, 345));
    start.push_back(get_point(793, 504));
    start.push_back(get_point(798, 512));
    start.push_back(get_point(787, 536));
    draw_curve(start, 5);

    start.clear();
    start.push_back(get_point(648, 365));
    start.push_back(get_point(777, 499));
    start.push_back(get_point(787, 536));
    draw_curve(start, 5);

    start.clear();
    start.push_back(get_point(581, 357));
    start.push_back(get_point(595, 407));
    start.push_back(get_point(746, 501));
    start.push_back(get_point(781, 547));
    draw_curve(start, 5);

    // EYE
    start.clear();
    start.push_back(get_point(526, 217));
    start.push_back(get_point(526, 221));
    start.push_back(get_point(529, 219));
    start.push_back(get_point(532, 215));
    start.push_back(get_point(534, 221));
    start.push_back(get_point(535, 230));
    start.push_back(get_point(542, 220));
    start.push_back(get_point(551, 211));
    start.push_back(get_point(558, 231));
    start.push_back(get_point(547, 250));
    start.push_back(get_point(540, 241));
    start.push_back(get_point(534, 237));
    start.push_back(get_point(529, 239));
    start.push_back(get_point(523, 242));
    start.push_back(get_point(526, 217));
    draw_curve(start, 5);

    start.clear();
    start.push_back(get_point(522, 209));
    start.push_back(get_point(510, 220));
    start.push_back(get_point(523, 251));
    start.push_back(get_point(561, 248));
    start.push_back(get_point(570, 228));
    start.push_back(get_point(558, 215));
    draw_curve(start, 5);

    // BODY
    start.clear();
    start.push_back(get_point(518, 427));
    start.push_back(get_point(488, 433));
    start.push_back(get_point(406, 410));
    draw_curve(start, 5);

    start.clear();
    start.push_back(get_point(406, 410));
    start.push_back(get_point(387, 419));
    start.push_back(get_point(381, 417));
    draw_curve(start, 5);

    start.clear();
    start.push_back(get_point(381, 417));
    start.push_back(get_point(361, 432));
    start.push_back(get_point(308, 421));
    start.push_back(get_point(270, 408));
    start.push_back(get_point(260, 410));
    start.push_back(get_point(213, 385));
    start.push_back(get_point(142, 359));
    start.push_back(get_point(102, 308));
    start.push_back(get_point(70, 244));
    start.push_back(get_point(65, 199));
    start.push_back(get_point(86, 144));
    start.push_back(get_point(124, 127));
    start.push_back(get_point(159, 127));
    start.push_back(get_point(175, 137));
    start.push_back(get_point(189, 134));
    start.push_back(get_point(198, 133));
    start.push_back(get_point(212, 149));
    start.push_back(get_point(219, 159));
    start.push_back(get_point(231, 153));
    start.push_back(get_point(256, 142));
    start.push_back(get_point(294, 186));
    draw_curve(start, 5);

    start.clear();
    start.push_back(get_point(294, 186));
    start.push_back(get_point(537, 181));
    draw_curve(start, 0);

    start.clear();
    start.push_back(get_point(433, 375));
    start.push_back(get_point(383, 416));
    draw_curve(start, 0);

    start.clear();
    start.push_back(get_point(491, 376));
    start.push_back(get_point(433, 375));
    start.push_back(get_point(214, 332));
    start.push_back(get_point(147, 243));
    start.push_back(get_point(162, 177));
    start.push_back(get_point(202, 165));
    start.push_back(get_point(224, 193));
    start.push_back(get_point(258, 186));
    start.push_back(get_point(294, 186));
    draw_curve(start, 5);

    glutSwapBuffers();
}

int main(int argc, char *argv[])
{
    glutInit(&argc, argv);
    glutInitDisplayMode(GLUT_RGB | GLUT_DEPTH | GLUT_DOUBLE);
    glutInitWindowSize(800, 600); // Set your own window size
    glutCreateWindow("Assignment 1");
    setup();
    glutDisplayFunc(display);
    glutMainLoop();
    return 0;
}
