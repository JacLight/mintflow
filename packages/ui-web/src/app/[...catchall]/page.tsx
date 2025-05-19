import { notFound } from 'next/navigation';

export default async function CatchAllPage({ params }: { params: { catchall: string[] } }) {
    return notFound();
}
