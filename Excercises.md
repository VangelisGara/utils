# Create a hook based on the following code

const [motdPreviewFileID, setMotdPreviewFileID] = useState(null)

useEffect(() => {
    async function fetchMotdPreviewFileId() {
        var previewFileID
        try {
            previewFileID = await fetchPreviewFileId(motd.storeName + ":" + motd.id)
            setMotdPreviewFileID(previewFileID)
        }
        catch (e) {
            previewFileID = null
        }
    }

    fetchMotdPreviewFileId()
}, [])
