type Props = {
  title: string;
  children: React.ReactNode;
};

export const ChartBox = ({ title, children }: Props) => {
  return (
    <div className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col justify-center items-center">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
};
