type ComingSoonProps = {
  title: string;
  description: string;
};

export default function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="max-w-2xl">
      <h1 className="page-header">{title}</h1>
      <p className="text-muted-foreground mt-2">{description}</p>
      <p className="mt-6 text-sm text-muted-foreground">
        This section is next on the roadmap: real Supabase data, mobile-first flows, and success metrics wired end to end.
      </p>
    </div>
  );
}
