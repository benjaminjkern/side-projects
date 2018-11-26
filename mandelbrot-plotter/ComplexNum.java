package Mandelbrot;


public class ComplexNum {

    double r,i;

    ComplexNum(double r, double i) {
        this.r = r;
        this.i = i;
    }

    ComplexNum(ComplexNum p) {
        this.r = p.r;
        this.i = p.i;
    }

    ComplexNum neg() {
        return new ComplexNum(-r,-i);
    }

    ComplexNum comp() {
        return new ComplexNum(r,-i);
    }

    ComplexNum add(ComplexNum c) {
        return new ComplexNum(r+c.r,i+c.i);
    }

    ComplexNum add(double d) {
        return add(new ComplexNum(d,0));
    }

    ComplexNum mult(ComplexNum c) {
        return new ComplexNum(r*c.r-i*c.i,i*c.r+r*c.i);
    }

    ComplexNum mult(double d) {
        return mult(new ComplexNum(d,0));
    }

    ComplexNum pow(ComplexNum c) {
        double theta = c.r*angle()+c.i*Math.log(modulo());
        ComplexNum a = new ComplexNum(Math.cos(theta),Math.sin(theta)).mult(new ComplexNum(Math.exp(c.r*Math.log(modulo())-c.i*angle()),0));
        return a;
    }

    ComplexNum pow(double d) {
        return pow(new ComplexNum(d,0));
    }

    double modulo() {
        return Math.sqrt(mult(new ComplexNum(r,i).comp()).r);
    }

    double angle() {
        return Math.atan2(i,r);
    }

    public String toString() {
        return r+" + "+i+"i";
    }

}