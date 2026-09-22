import { useState } from "react";
import {  fetchNotes } from "../../services/noteService";
import NoteList from "../NoteList/NoteList";
import Pagination from "../Pagination/Pagination";
import { useDebouncedCallback } from "use-debounce";
import SearchBox from "../SearchBox/SearchBox";
import Modal from "../Modal/Modal";
import NoteForm from "../NoteForm/NoteForm";
import css from "./App.module.css";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

function App() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const perPage = 12;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpen = () => {
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["notes", page, perPage, search],
    queryFn: () => fetchNotes({ page, perPage, search }),
    placeholderData: keepPreviousData,
  });

  const debouncedSearch = useDebouncedCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, 300);
  return (
    <div className={css.app}>
      <div className={css.toolbar}>
        <SearchBox onSearch={debouncedSearch} />

        <button type="button" onClick={handleOpen} className={css.button}>
          Create note
        </button>
      </div>

      {data && data.totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={data.totalPages}
          onPageChange={setPage}
        />
      )}
      {isLoading && <p>Loading...</p>}
      {isError && <p>Something went wrong.</p>}
      {data && data.notes.length > 0 && <NoteList notes={data.notes} />}
      {isModalOpen && (
        <Modal onClose={handleClose}>
          <NoteForm onCancel={handleClose} />
        </Modal>
      )}
      {data && data.notes.length === 0 && <p>No notes found</p>}
    </div>
  );
}

export default App;
