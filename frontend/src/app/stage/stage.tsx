import Route from './route';
import Results from './results';

export default async function Stage({
  stageId
}: {
  stageId: string | number;
}): Promise<JSX.Element> {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow flex flex-row" id="main-app-container">
        <Route stageId={stageId} />
        <Results stageId={stageId} />
      </div>
    </div>
  );
}
