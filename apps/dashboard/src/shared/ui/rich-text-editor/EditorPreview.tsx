export default function EditorPreview({ html }: { html: string }) {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: html }}></div>
    </>
  );
}
