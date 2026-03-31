import { useI18n } from './i18n-context';
import { Button } from '../../components/ui';

export function LanguageToggle() {
  const { language, setLanguage } = useI18n();

  return (
    <div className="inline-flex items-center gap-1 rounded-md border border-border bg-background/80 p-1">
      <Button
        type="button"
        size="sm"
        variant={language === 'en' ? 'default' : 'ghost'}
        onClick={() => setLanguage('en')}
      >
        EN
      </Button>
      <Button
        type="button"
        size="sm"
        variant={language === 'de' ? 'default' : 'ghost'}
        onClick={() => setLanguage('de')}
      >
        DE
      </Button>
    </div>
  );
}
