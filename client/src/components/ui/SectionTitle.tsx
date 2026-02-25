interface Props {
  categoryName: string;
  categorydescription?: string;
}

export default function SectionTitle({
  categoryName,
  categorydescription,
}: Props) {
  return (
    <div className="mb-4 px-1">
      <h2 className="text-[20px] font-extrabold text-gray-900 tracking-tight">
        {categoryName}
      </h2>

      <p className="text-[13px] font-medium text-gray-500 mt-1">
        {categorydescription || "Freshly made with premium ingredients"}
      </p>
    </div>
  );
}