import React, { useState, useEffect } from 'react';
import { GradientData } from '@/api/types';
import { getTextWidth } from '@/utils/svg';

export function MouseOverLine(
  {
    hoverPoint,
    margin,
    dims,
    x,
    y,
    lineProps,
    circleProps,
    textProps
  }: {
    hoverPoint: GradientData | null;
    margin: { top: number; right: number; bottom: number; left: number };
    dims: { width: number; height: number };
    x: d3.ScaleLinear<number, number>;
    y: d3.ScaleLinear<number, number>;
    lineProps?: React.SVGProps<SVGLineElement>;
    circleProps?: React.SVGProps<SVGCircleElement>;
    textProps?: React.SVGProps<SVGTextElement>;
  }
): JSX.Element {
  if (hoverPoint === null) return <></>;

  const distancePos = x(hoverPoint.distance);
  const elevationPos = y(hoverPoint.elevation);

  const circleRadius = 2.5;
  const circleFill = 'none';
  const strokeWidth = 2;
  const strokeColor = 'black';

  const textStyle = {
    fontSize: '10px',
    textAnchor: 'left',
  };

  const allTextProps = {
    ...textStyle,
    ...textProps
  };

  return (
    <g>
      <line
        x1={distancePos}
        x2={distancePos}
        y1={dims.height - margin.bottom}
        y2={elevationPos + circleRadius}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        {...lineProps}
      />
      <circle
        cx={distancePos}
        cy={elevationPos}
        r={circleRadius}
        fill={circleFill}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        {...circleProps}
      />
      <MouseOverLineText
        xpos={distancePos}
        ypos={elevationPos}
        dims={dims}
        margin={margin}
        gradientPoint={hoverPoint}
        textProps={allTextProps}
      />
    </g>
  );
}

function SVGTextBox(
  { xpos, ypos, text, textProps }: {
    xpos: number;
    ypos: number;
    text: string;
    textProps?: React.SVGProps<SVGTextElement>;
  }
): JSX.Element {
  return (
    <text
      x={xpos}
      y={ypos}
      {...textProps}
    >
      {text}
    </text>
  );
}

function MouseOverLineText(
  { xpos, ypos, gradientPoint, dims, margin, fontSize = 10, textProps }: {
    xpos: number;
    ypos: number;
    gradientPoint: GradientData;
    dims: { width: number; height: number };
    margin: { top: number; right: number; bottom: number; left: number };
    fontSize?: number;
    textProps?: React.SVGProps<SVGTextElement>;
  }
): JSX.Element {
  // Set the padding values
  const boxPadding = 4;
  const needlePadding = 5;

  // Create the text content to measure
  const texts = [
    `${(gradientPoint.distance / 1000).toFixed(0).toString()}km`,
    `${gradientPoint.elevation.toFixed(0).toString()}m`,
    `${gradientPoint.gradient?.toFixed(0).toString() ?? '0'}%`
  ];

  const maxTextsLength = Math.max(...texts.map(text => text.length));

  // Calculate the maximum text width
  const [boxWidth, setBoxWidth] = useState(0);
  useEffect(() => {
    // Calculate the maximum text width
    const maxWidth = Math.max(
      ...texts.map(text => getTextWidth(text, fontSize))
    );
    setBoxWidth(maxWidth + (boxPadding * 2));
  }, [maxTextsLength, fontSize, boxPadding]);

  // Calculate the box dimensions
  const boxHeight = (fontSize * texts.length) + (boxPadding * 2);
  const boxTop = ypos - boxHeight / 2;
  const boxLeft = xpos + needlePadding;
  const boxRight = boxLeft + boxWidth;
  const boxBottom = boxTop + boxHeight;

  // Check if the box overflows any edges of the chart
  const overflowsRight = boxRight > dims.width - margin.right;
  const overflowsBottom = boxBottom > dims.height - margin.bottom;
  const overflowsTop = boxTop < margin.top;

  // Calculate the transform values to align the box in the correct position
  // Do not allow the box to overflow the edges of the chart
  const xTransform = overflowsRight
    ? boxLeft - boxWidth - (2 * needlePadding)
    : boxLeft;
  let yTransform = boxTop;
  if (overflowsBottom) {
    yTransform = dims.height - margin.bottom - boxHeight;
  } else if (overflowsTop) {
    yTransform = margin.top;
  }

  return (
    <g transform={`translate(${xTransform},${yTransform})`}>
      <rect
        x={0}
        y={0}
        width={boxWidth}
        height={boxHeight}
        fill="white"
        stroke="black"
        strokeWidth={1}
        opacity={0.8}
        rx={fontSize / 2}
      />
      {texts.map((text, i) => (
        <SVGTextBox
          key={i}
          xpos={boxPadding}
          ypos={boxPadding / 2 + ((i + 1) * fontSize)}
          text={text}
          textProps={textProps}
        />
      ))}
    </g>
  );
}
