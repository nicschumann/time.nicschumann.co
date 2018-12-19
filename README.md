# Nic's Time Garden

1. **Because the fundamental unit of value is the investment of human time.** As the availability of other resources fluctuates and changes, available time remains a static  quantity for each individual. The real question is "how are you going to spend it"?
2. **Because I have an obsessive and adversarial relationship with measurement and management.**


## What is this?

This is a tool for visualizing time tracking information from project management and time tracking applications. My goal is simply to visualize the information I've collected from 11/15/2017 to 12/15/2018 in [Paymo](http://paymo.com). This document outlines the visualization and interface units I'd like to build, and their current states.

## Captured Data

For the last year+, I've captured detailed time-tracking information in Paymo. I've captured time entries that include:

- A `start time`, denoting when the time entry starts as `Y/m/d H:i:s`.
- A `finish time`, denoting when the time entry starts as `Y/m/d H:i:s`.
- A `client` – the person or entity sponsoring the time investment.
- A `project` – the project that I'm working on during that time.
- A `task` – the specific tasking I'm working on.
- A `description` - a freeform piece of text describing what I'm doing. Typically about a sentence long. Sometimes tongue-in-cheek.
- A `satisfaction (S) score` – a score from 1 – 10 indicating how satisfied I was with my choice of the way I spent that time. A low satisfaction score means that I'd do something different with that time, if I could.
- A `productivity (P) score` – a score from 1 - 10 indicating how much value I feel I generated with this time investment. A low productivity score means low value generation, and conversely.
- A `enjoyment (E) score` – a score from 1 - 10 indicating how much I enjoyed the activity, when it was happening.

## Visualization Modules

These modules describe visualizations that I'd like to produce to support interactions or static display.

### Day Details

The `Hours Summary` module provides an interactive view of a single day. it shows a graph-like interface of the day, where the `x`-axis runs as time, and the `y`-axis is a triple scale for plotting `SPE`-scores. This visualization allows us to get a quick read of the high and low points of the day, as well as the spatial relationships between those points.

|state        |completed
|---          |---
|designed     |**✔**
|frontend     |**✔**
|integrated   |✗
|interactions |✗


### Week Details

The `Week Details` module provides a way of contrasting different weeks in terms of how their `SPE`-scores are laid out in time. Week details shows us what kinds of scores tend to happen when in the day, and allows us to take a look at broader trends across the month.

|state        |completed
|---          |---
|designed     |✗
|frontend     |**✔**
|integrated   |**✔**
|interactions |✗


### Average over Time

The `Average over Time` module provides statistical summaries that condense the `SPE`-scores for a single time-period. Given a set of time entries for a time-period off of the Paymo API, this module produces summary statistics for each of the satisfaction, productivity, and enjoyment scores. For each of these, the Day Summary produces the min, max, day average as well as the standard deviation from the average, and it visualizes these as box-bar plots, with a topline for the max, a bottom line for the min, a tick for the average, and a box representing one standard deviation around the mean. Our current use-case uses these to show daily summaries, but you can use this for any time period.

|state        |completed
|---          |---
|designed     |**✔**
|frontend     |**✔**
|integrated   |**✔**
|interactions |✗

### Running Average

The `Running Average` module provides a way to visualize a sequence of windowed averages over time. Basically, it provides a way of viewing how the average shifts in time, as a fixed-size window is slid across all of the time entries. For example, we might take the window to be 5 days wide, and look at two months of time, sliding the window forward in 1 day increments. We'd get two months worth of averages, each averaging over a 5 day window around the day in question. This shows us how average experience changes over time, or over criteria.

|state        |completed
|---          |---
|designed     |✗
|frontend     |✗
|integrated   |✗
|interactions |✗



## Interface Modules

These modules describe interactions that I'd like to enable on the front-end for the data-explorer.

### Date Range

The `Date Range` module should allow the user to specify the date ranges they're interested in through a simple date picker. On interaction, it should redisplay the visualizations on the page, bracketed by the time interval specified by the date-picker. The module should also display simple error messages, if the dates selected don't make sense.

|state        |completed
|---          |---
|designed     |✗
|frontend     |✗
|integrated   |✗
|interactions |✗


### Aggregator

The `Aggregator` module is a core tool for doing comparisons of time entries. It allows us to say things like "Show me all entries `X` matching some criteria `P(Xᵢ)`, and aggregate the result as some aggregation `Y(X₁, X₂, ... Xₙ)`". Here, `Y` is some summary statistic of the `Xᵢ`. This is a filter-map-reduce framework that selects from Paymo, optionally transforms the output, and reduces the output into a summary.

This module requires a clear interface where these summary methods can be stacked and run. This interface would provide a way of selecting a date-range, a criterion, and an aggregation, and running the routine to update a visualization. It should also have a way of stacking multiple aggregations for side-by-size comparison.

|state        |completed
|---          |---
|designed     |✗
|frontend     |✗
|integrated   |✗
|interactions |✗

#### Aggregations to Consider

- `Average`. Calculate the average of the `SPE`-values over a given time period, and with a given filter criterion.
- `Running Average`. Calculate the running average of the `SPE`-values or a fixed time window over a given time period, and with a given filter criterion.
