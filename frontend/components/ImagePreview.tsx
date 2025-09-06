interface Props {
before: string;
after: string;
summary: string;
}


export default function ImagePreview({ before, after, summary }: Props) {
return (
<div className="grid grid-cols-2 gap-4 mt-6">
<div>
<h2 className="font-semibold mb-2">Original</h2>
<img src={before} alt="Original" className="rounded shadow" />
</div>
<div>
<h2 className="font-semibold mb-2">Processed</h2>
<img src={after} alt="Processed" className="rounded shadow" />
<p className="mt-2 text-sm text-gray-600">{summary}</p>
</div>
</div>
);
}