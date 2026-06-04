import Card from '../../components/ui/Card';

export default function AdminModule({ title, description, children }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        <p className="text-gray-text">{description}</p>
      </div>
      {children || (
        <Card className="text-center py-16">
          <p className="text-gray-text">Módulo en desarrollo</p>
          <p className="text-gold text-sm mt-2">Próximamente disponible</p>
        </Card>
      )}
    </div>
  );
}
