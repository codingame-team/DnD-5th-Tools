import { useFogStore } from "../state/fogStore";

export default function MJPanel() {
  const { cells } = useFogStore();

  return (
    <div>
      <h3>MJ Notes</h3>
      {Object.entries(cells).map(([key, cell]) => (
        cell.note && (
          <div key={key}>
            <strong>{key}</strong>
            <p>{cell.note}</p>
          </div>
        )
      ))}
    </div>
  );
}
