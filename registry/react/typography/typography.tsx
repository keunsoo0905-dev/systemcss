import React from "react";

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
}

export function Instruction({
  as: Tag = "p",
  className,
  children,
  ...props
}: TypographyProps) {
  return (
    <Tag className={`instruction ${className ?? ""}`.trim()} {...props}>
      {children}
    </Tag>
  );
}

export function InstructionPrimary({
  as: Tag = "p",
  className,
  children,
  ...props
}: TypographyProps) {
  return (
    <Tag
      className={`instruction instruction-primary ${className ?? ""}`.trim()}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function HeaderDocument({
  as: Tag = "h1",
  className,
  children,
  ...props
}: TypographyProps) {
  return (
    <Tag
      className={`header header-document ${className ?? ""}`.trim()}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function HeaderGroup({
  as: Tag = "h2",
  className,
  children,
  ...props
}: TypographyProps) {
  return (
    <Tag
      className={`header header-group ${className ?? ""}`.trim()}
      {...props}
    >
      {children}
    </Tag>
  );
}
