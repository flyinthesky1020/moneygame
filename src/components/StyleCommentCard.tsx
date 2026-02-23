"use client";

type Props = {
  styleTag: string;
  styleText: string;
};

export default function StyleCommentCard({ styleTag, styleText }: Props) {
  return (
    <div className="style-card">
      <div className="style-tag">{styleTag}</div>
      <p>{styleText}</p>
    </div>
  );
}
