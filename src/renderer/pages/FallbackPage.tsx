export default function FallbackPage() {
  return (
    <div className="w-screen h-screen flex justify-center items-center bg-[#FBFBFA]">
      <div className="text-center p-10 max-w-[400px]">
        <div className="text-5xl mb-5 grayscale-[20%]">⚠️</div>
        <h1 className="text-2xl font-semibold text-[#37352F] m-0 mb-3 tracking-tight">Oops!</h1>
        <p className="text-base font-normal text-[#787774] m-0 leading-normal tracking-tight">
          It seems that your environment is not ready.
        </p>
      </div>
    </div>
  );
}
