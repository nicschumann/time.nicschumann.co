'use strict';

module.exports = function( constants ) {
    return function compute_sizing( data, x_extent, y_extent ) {

        var sizing = {

            diagram: { margins: { x: constants.diagram_x_margin, y: constants.diagram_y_margin } },

            day: { positions: {}, margins: { r: constants.day_r_margin, b: constants.day_b_margin } },

            labels: { },

            entry: { frame: { margins: {} }, margins: { } }
        };

        sizing.diagram.width = x_extent - constants.diagram_x_margin;
        sizing.day.height = (y_extent / constants.weeks_per_screen) - sizing.day.margins.b;

        sizing.diagram.height = (sizing.day.height + sizing.day.margins.b) * data.length + constants.diagram_y_margin;
        sizing.day.width = sizing.diagram.width;


        sizing.day.positions.x = {
            Sunday: 0,
            Monday: (sizing.day.width + sizing.day.margins.r),
            Tuesday: 2 * (sizing.day.width + sizing.day.margins.r),
            Wednesday: 3 * (sizing.day.width + sizing.day.margins.r),
            Thursday: 4 * (sizing.day.width + sizing.day.margins.r),
            Friday: 5 * (sizing.day.width + sizing.day.margins.r),
            Saturday: 6 * (sizing.day.width + sizing.day.margins.r)
        };

        sizing.labels.font_size = Math.min( sizing.day.width, constants.label_font_max_size );
        sizing.labels.font_width = sizing.labels.font_size / 2;
        sizing.labels.padding = 3 * sizing.labels.font_size / 4;

        sizing.entry.margins.top = 50;
        sizing.entry.margins.left = 5;
        sizing.entry.height = sizing.day.height - sizing.entry.margins.top;

        return sizing;

    };
};
