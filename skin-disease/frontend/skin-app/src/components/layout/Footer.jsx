import { useTranslation } from 'react-i18next';
import { Stethoscope } from 'lucide-react';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-slate-900 text-slate-400 py-10">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Stethoscope size={22} className="text-blue-400" />
          <span className="text-white font-bold text-xl">DermaLens</span>
        </div>
        <p className="text-sm mb-4">{t('footer.tagline')}</p>
        <p className="text-xs text-slate-600">{t('footer.copyright')}</p>
      </div>
    </footer>
  );
};

export default Footer;
