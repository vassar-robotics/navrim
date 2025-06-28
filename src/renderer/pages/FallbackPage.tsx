import { useNavigate } from 'react-router-dom';

export default function FallbackPage() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/welcome');
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-[#FBFBFA]">
      <div className="text-center p-10 max-w-[400px]">
        <div className="text-5xl mb-5 grayscale-[20%]">⚠️</div>
        <h1 className="text-2xl font-semibold text-[#37352F] m-0 mb-3 tracking-tight">Oops!</h1>
        <p className="text-base font-normal text-[#787774] m-0 leading-normal tracking-tight">
          It seems that your environment is not ready.
        </p>
        <button
          onClick={handleGoBack}
          className="mt-6 px-6 py-2.5 bg-[#37352F] text-white rounded-md text-sm font-medium hover:bg-[#2D2B26] active:bg-[#252320] transition-colors"
        >
          ← Go Back
        </button>
      </div>
    </div>
  );
}
