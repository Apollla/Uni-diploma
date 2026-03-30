type Props = {
  title: string;
  value: number;
};

export const Card = ({ title, value }: Props) => {
  return (
    <div className="  bg-white border rounded-2xl shadow-sm p-6 flex flex-col justify-center items-center w-full transition hover:bg-blue-500 hover:border-white group">
      <p className="text-sm text-gray-500 text-center group-hover:text-white">{title}</p>
      <h2 className="text-2xl font-semibold mt-2 group-hover:text-white">{value}</h2>
    </div>
  );
};


