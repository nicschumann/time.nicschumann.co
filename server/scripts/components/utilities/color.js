'use strict';

var linear = require('./index.js').linear_map;

function rgba_s_component( d ) {
    return {
        r: linear( 0, 10 )( 100, 0 )( d.satisfaction.avg ),
        g: linear( 0, 10 )( 100, 0 )( d.satisfaction.avg ),
        b: 100
    };
}

function rgba_p_component( d ) {
    return {
        r: 100,
        g: linear( 0, 10 )( 100, 0 )( d.productivity.avg ),
        b: linear( 0, 10 )( 100, 0 )( d.productivity.avg )
    };
}

function rgba_e_component( d ) {
    return {
        r: 130,
        g: 130,
        b: linear( 0, 10 )( 100, 0 )( d.enjoyment.avg )
    };
}

function rgba_sum_components( d ) {
    return {
        r: Math.min( rgba_s_component(d).r + rgba_p_component(d).r + rgba_e_component(d).r, 255),
        g: Math.min( rgba_s_component(d).g + rgba_p_component(d).g + rgba_e_component(d).g, 255),
        b: Math.min( rgba_s_component(d).b + rgba_p_component(d).b + rgba_e_component(d).b, 255)
    };
}


function rgba_p( d ) {

    return [
        'rgb(',
            Math.min( rgba_p_component(d).r + linear( 0, 10 )( 0, 155 )( d.productivity.avg ), 255),
            ',',
            Math.min( rgba_p_component(d).g, 255),
            ',',
            Math.min( rgba_p_component(d).b, 255),
        ');'
    ].join('');

}
function rgba_s( d ) {

    return [
        'rgb(',
            Math.min( rgba_s_component(d).r + 0, 255),
            ',',
            Math.min( rgba_s_component(d).g + 0, 255),
            ',',
            Math.min( rgba_s_component(d).b + 0, 255) + linear( 0, 10 )( 0, 155 )( d.satisfaction.avg ),
        ');'
    ].join('');

}
function rgba_e( d ) {

    return [
        'rgb(',
            Math.min( rgba_e_component(d).r + linear( 0, 10 )( 0, 125 )( d.enjoyment.avg ), 255),
            ',',
            Math.min( rgba_e_component(d).g + linear( 0, 10 )( 0, 125 )( d.enjoyment.avg ), 255),
            ',',
            Math.min( rgba_e_component(d).b + 0, 255),
        ');'
    ].join('');

}

function rgba_all( d ) {

    return [
        'rgb(',
            Math.min( rgba_s_component(d).r + rgba_p_component(d).r + rgba_e_component(d).r, 255),
            ',',
            Math.min( rgba_s_component(d).g + rgba_p_component(d).g + rgba_e_component(d).g, 255),
            ',',
            Math.min( rgba_s_component(d).b + rgba_p_component(d).b + rgba_e_component(d).b, 255),
        ');'
    ].join('');

}


module.exports = {
    satisfaction: rgba_s_component,
    productivity: rgba_p_component,
    enjoyment: rgba_e_component,
    all: rgba_sum_components,
    rgb: {
        satisfaction: rgba_s,
        productivity: rgba_p,
        enjoyment: rgba_e,
        all: rgba_all
    }
};
