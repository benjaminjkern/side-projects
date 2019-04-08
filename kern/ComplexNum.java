package kern;

// A toolkit for implementing complex numbers with double precision


public class ComplexNum {

    double r,i;

    public ComplexNum(double r, double i) {
        this.r = r;
        this.i = i;
    }

    public ComplexNum(ComplexNum p) {
        this.r = p.r;
        this.i = p.i;
    }

    public ComplexNum neg() {
        return new ComplexNum(-r,-i);
    }

    public ComplexNum comp() {
        return new ComplexNum(r,-i);
    }

    public ComplexNum add(ComplexNum c) {
        return new ComplexNum(r+c.r,i+c.i);
    }

    public ComplexNum add(double d) {
        return add(new ComplexNum(d,0));
    }

    public ComplexNum mult(ComplexNum c) {
        return new ComplexNum(r*c.r-i*c.i,i*c.r+r*c.i);
    }

    public ComplexNum mult(double d) {
        return mult(new ComplexNum(d,0));
    }

    public ComplexNum pow(ComplexNum c) {
        double theta = c.r*angle()+c.i*Math.log(modulo());
        return new ComplexNum(Math.cos(theta),Math.sin(theta)).mult(new ComplexNum(Math.exp(c.r*Math.log(modulo())-c.i*angle()),0));
    }

    public ComplexNum pow(double d) {
        return pow(new ComplexNum(d,0));
    }

    public double modulo() {
        return Math.sqrt(mult(new ComplexNum(r,i).comp()).r);
    }

    public double angle() {
        return Math.atan2(i,r);
    }

    public String toString() {
        return r+" + "+i+"i";
    }

}
